import * as React from 'react';
import { FilePicker, IFilePickerResult } from '@pnp/spfx-controls-react/lib/FilePicker';
import { PrimaryButton, TextField, IconButton } from '@fluentui/react';

export interface ICollectionFilePickerProps {
    context: any; // Allow BaseComponentContext
    value: string;
    onChanged: (url: string) => void;
}

export const CollectionFilePicker: React.FC<ICollectionFilePickerProps> = (props) => {
    const [selectedFile, setSelectedFile] = React.useState<string>(props.value);

    const onFileChange = (filePickerResult: IFilePickerResult[]) => {
        if (filePickerResult && filePickerResult.length > 0) {
            const url = filePickerResult[0].fileAbsoluteUrl;
            setSelectedFile(url);
            props.onChanged(url);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <TextField
                    value={selectedFile}
                    onChange={(e, newValue) => { setSelectedFile(newValue || ''); props.onChanged(newValue || ''); }}
                    placeholder="https://..."
                    styles={{ root: { flexGrow: 1 } }}
                />
                {selectedFile && (
                    <IconButton
                        iconProps={{ iconName: 'Cancel' }}
                        title="Clear"
                        onClick={() => { setSelectedFile(''); props.onChanged(''); }}
                    />
                )}
            </div>
            <FilePicker
                bingAPIKey=""
                accepts={[".gif", ".jpg", ".jpeg", ".bmp", ".dib", ".tif", ".tiff", ".ico", ".png", ".svg"]}
                buttonLabel="Select Logo"
                buttonIcon="FileImage"
                onSave={onFileChange}
                onChanged={onFileChange}
                context={props.context}
                hideWebSearchTab={true}
                hideStockImages={false}
                hideLocalUploadTab={false}
                hideLinkUploadTab={false}
                hideOneDriveTab={true}
            />
        </div>
    );
};
