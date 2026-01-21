import * as React from 'react';
import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
import { TextField, ChoiceGroup, IChoiceGroupOption, Image, ImageFit, DefaultButton } from '@fluentui/react';

const MAX_IMAGE_WIDTH = 300;

/**
 * Resizes a base64 image if it exceeds MAX_IMAGE_WIDTH.
 * Returns a promise with the (possibly resized) base64 string.
 */
const resizeImageIfNeeded = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
        // Only process data URLs (base64 images)
        if (base64.indexOf('data:image') !== 0) {
            resolve(base64);
            return;
        }

        const img = document.createElement('img');
        img.onload = (): void => {
            if (img.width <= MAX_IMAGE_WIDTH) {
                // No resize needed
                resolve(base64);
                return;
            }

            // Calculate new dimensions maintaining aspect ratio
            const ratio = MAX_IMAGE_WIDTH / img.width;
            const newWidth = MAX_IMAGE_WIDTH;
            const newHeight = Math.round(img.height * ratio);

            // Create canvas and draw resized image
            const canvas = document.createElement('canvas');
            canvas.width = newWidth;
            canvas.height = newHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0, newWidth, newHeight);
                // Convert to JPEG with 85% quality for smaller size
                const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                resolve(resizedBase64);
            } else {
                resolve(base64); // Fallback if canvas fails
            }
        };
        img.onerror = (): void => {
            resolve(base64); // Fallback on error
        };
        img.src = base64;
    });
};

export interface ICollectionFilePickerProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context: any; // Allow BaseComponentContext
    value: string;
    onChange: (url: string) => void;
}

export const CollectionFilePicker: React.FC<ICollectionFilePickerProps> = (props) => {
    const [selectedFile, setSelectedFile] = React.useState<string>(props.value || '');
    const [inputMethod, setInputMethod] = React.useState<'url' | 'picker'>('url');
    const [isPickerOpen, setIsPickerOpen] = React.useState<boolean>(false);
    const [pickerKey, setPickerKey] = React.useState<number>(Date.now());

    React.useEffect(() => {
        if (props.value !== selectedFile) {
            setSelectedFile(props.value || '');
        }
        setIsPickerOpen(false);
    }, [props.value]);

    React.useEffect(() => {
        if (isPickerOpen) {

            const intervalId = setInterval(() => {
                // 1. Target the Manage Links Panel (The "Trap" Container)
                // We need to bust the Stacking Context here so the child can escape via Z-Index
                const collectionPanel = document.querySelector('div[class*="PropertyFieldCollectionData__panel"]');
                if (collectionPanel) {
                    const collectionLayer = collectionPanel.closest('.ms-Layer') as HTMLElement;
                    if (collectionLayer) {
                        // Lower the Z-Index
                        if (collectionLayer.style.zIndex !== '1000') {
                            collectionLayer.style.setProperty('z-index', '1000', 'important');
                        }
                    }

                    // CRITICAL: Remove properties that create a new Stacking Context on the panel content
                    // This allows the child (FilePicker) z-index to compete globally
                    const panelContent = collectionPanel.querySelector('.ms-Panel-main') as HTMLElement;
                    if (panelContent) {
                        // Fluent UI uses transform for animations, which traps z-index
                        // We remove it after the animation is likely done
                        if (panelContent.style.transform) {
                            panelContent.style.transform = 'none';
                            panelContent.style.willChange = 'auto';
                            panelContent.style.filter = 'none';
                            panelContent.style.perspective = 'none';
                            panelContent.style.contain = 'none';
                        }
                    }
                }

                // 2. Target the File Picker Panel
                // Now that the parent trap is gone, we just need a high Z-Index
                const pickerPanel = document.querySelector('.pnp__file-picker__panel') || document.querySelector('.quick-links-file-picker-panel');
                if (pickerPanel) {
                    const pickerLayer = pickerPanel.closest('.ms-Layer') as HTMLElement;
                    if (pickerLayer) {
                        // We DO NOT move the node (appendChild) anymore as it breaks React

                        // Just Enforce High Z-Index
                        const currentZ = pickerLayer.style.zIndex;
                        if (currentZ !== '2147483647') {
                            // 1. Layer Base
                            pickerLayer.style.setProperty('z-index', '2147483647', 'important');

                            // 2. Overlay (Background)
                            const overlay = pickerLayer.querySelector('.ms-Overlay') as HTMLElement;
                            if (overlay) {
                                overlay.style.setProperty('z-index', '2147483648', 'important');
                            }

                            // 3. Content Panel (Must be highest)
                            const content = pickerLayer.querySelector('.ms-Panel-main, .ms-Dialog-main, .ms-Modal-scrollableContent') as HTMLElement;
                            if (content) {
                                content.style.setProperty('z-index', '2147483649', 'important');
                            }
                        }
                    }
                }
            }, 100);

            // Stop polling after 5 seconds (give time for animations to finish)
            setTimeout(() => {
                clearInterval(intervalId);
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [isPickerOpen]);

    const onFileChange = (filePickerResult: IFilePickerResult[]): void => {
        if (filePickerResult && filePickerResult.length > 0) {
            const result = filePickerResult[0];
            // Priority: fileAbsoluteUrl (SharePoint) > previewDataUrl (local upload base64)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const url = result.fileAbsoluteUrl || result.previewDataUrl || (result as any).url;
            if (url) {
                // Resize large base64 images before saving
                resizeImageIfNeeded(url).then((processedUrl) => {
                    setSelectedFile(processedUrl);
                    props.onChange(processedUrl);
                }).catch(() => {
                    // Fallback: use original URL
                    setSelectedFile(url);
                    props.onChange(url);
                });
            }
        }
        setIsPickerOpen(false);
    };

    const onPickerCancel = (): void => {
        setIsPickerOpen(false);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleManualChange = (e: any, newValue?: string): void => {
        const val = newValue || '';
        setSelectedFile(val);
        props.onChange(val);
    };

    const openPicker = (): void => {
        setPickerKey(Date.now());
        setIsPickerOpen(true);
    };

    const inputOptions: IChoiceGroupOption[] = [
        { key: 'url', text: 'Enter URL manually' },
        { key: 'picker', text: 'Select from Site (File Picker)' }
    ];

    return (
        <div style={{ marginBottom: '10px' }}>
            {/* 2-Column Layout: Preview Left, Controls Right */}
            <div style={{
                display: 'flex',
                gap: '16px',
                alignItems: 'flex-start',
                padding: '12px',
                backgroundColor: '#fafafa',
                borderRadius: '4px',
                border: '1px solid #edebe9'
            }}>
                {/* Left Column: Preview */}
                <div style={{
                    flexShrink: 0,
                    width: '80px',
                    height: '80px',
                    border: '1px dashed #ccc',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}>
                    {selectedFile ? (
                        <Image
                            src={selectedFile}
                            alt="Logo"
                            imageFit={ImageFit.contain}
                            width={70}
                            height={70}
                        />
                    ) : (
                        <span style={{ color: '#a19f9d', fontSize: '11px', textAlign: 'center' }}>No Logo</span>
                    )}
                </div>

                {/* Right Column: Controls */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Logo Source - Horizontal Radio */}
                    <ChoiceGroup
                        options={inputOptions}
                        selectedKey={inputMethod}
                        onChange={(e, option) => setInputMethod(option!.key as 'url' | 'picker')}
                        label="Logo Source"
                        styles={{
                            flexContainer: { display: 'flex', gap: '16px' },
                            label: { marginBottom: '4px', fontSize: '13px', fontWeight: 600 }
                        }}
                    />

                    {/* Input Field or Button */}
                    <div style={{ marginTop: '8px' }}>
                        {inputMethod === 'url' ? (
                            <TextField
                                value={selectedFile}
                                onChange={handleManualChange}
                                placeholder="https://..."
                                styles={{ root: { maxWidth: '100%' } }}
                            />
                        ) : (
                            <>
                                <DefaultButton
                                    text="Select Logo"
                                    iconProps={{ iconName: 'FileImage' }}
                                    onClick={openPicker}
                                    styles={{ root: { minWidth: '120px' } }}
                                />
                                {isPickerOpen && (
                                    <FilePicker
                                        bingAPIKey=""
                                        accepts={[".gif", ".jpg", ".jpeg", ".bmp", ".dib", ".tif", ".tiff", ".ico", ".png", ".svg"]}
                                        buttonLabel=""
                                        buttonIcon=""
                                        onSave={onFileChange}
                                        onChange={onFileChange}
                                        onCancel={onPickerCancel}
                                        context={props.context}
                                        hideWebSearchTab={true}
                                        hideStockImages={false}
                                        hideLocalUploadTab={false}
                                        hideLinkUploadTab={false}
                                        hideOneDriveTab={true}
                                        isPanelOpen={true}
                                        key={pickerKey}
                                        panelClassName="quick-links-file-picker-panel"
                                    />
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
