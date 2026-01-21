import * as React from 'react';
import { TextField, IconButton, Callout, DirectionalHint, PrimaryButton, DefaultButton, ColorPicker, IColor } from '@fluentui/react';
import { useId, useBoolean } from '@fluentui/react-hooks';

export interface IColorPickerFieldProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
    disabled?: boolean;
}

export const ColorPickerField: React.FC<IColorPickerFieldProps> = (props) => {
    const [color, setColor] = React.useState<string>(props.value || '#000000');
    const [tempColor, setTempColor] = React.useState<string>(props.value || '#000000');
    const [isCalloutVisible, { toggle: toggleCallout, setFalse: hideCallout }] = useBoolean(false);
    const buttonId = useId('color-picker-button');

    React.useEffect(() => {
        if (props.value !== color) {
            setColor(props.value || '#000000');
            setTempColor(props.value || '#000000');
        }
    }, [props.value]);

    const handleTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        const val = newValue || '';
        // Allow partial input while typing
        setColor(val);
        // Only propagate valid hex colors
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            props.onChange(val);
        }
    };

    const handleColorPickerChange = (ev: React.SyntheticEvent<HTMLElement>, colorObj: IColor): void => {
        setTempColor('#' + colorObj.hex);
    };

    const handleOk = (): void => {
        setColor(tempColor);
        props.onChange(tempColor);
        hideCallout();
    };

    const handleCancel = (): void => {
        setTempColor(color);
        hideCallout();
    };

    return (
        <div style={{ marginBottom: '10px' }}>
            <label style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 600,
                fontSize: '14px',
                color: '#323130'
            }}>
                {props.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                    style={{
                        width: '28px',
                        height: '28px',
                        backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#ffffff',
                        border: '1px solid #8a8886',
                        borderRadius: '2px',
                        flexShrink: 0
                    }}
                />
                <TextField
                    value={color}
                    onChange={handleTextChange}
                    placeholder="#000000"
                    styles={{
                        root: { width: '100px' },
                        field: { fontFamily: 'monospace' }
                    }}
                    disabled={props.disabled}
                />
                <IconButton
                    id={buttonId}
                    iconProps={{ iconName: 'Color' }}
                    title="Pick color"
                    onClick={toggleCallout}
                    disabled={props.disabled}
                    styles={{
                        root: {
                            backgroundColor: '#f3f2f1',
                            border: '1px solid #8a8886',
                            borderRadius: '2px'
                        },
                        rootHovered: {
                            backgroundColor: '#edebe9'
                        }
                    }}
                />
            </div>

            {isCalloutVisible && (
                <Callout
                    role="dialog"
                    gapSpace={0}
                    target={`#${buttonId}`}
                    onDismiss={handleCancel}
                    directionalHint={DirectionalHint.rightTopEdge}
                    setInitialFocus
                    styles={{
                        root: {
                            padding: '16px',
                            boxShadow: '0 6.4px 14.4px 0 rgba(0,0,0,.132), 0 1.2px 3.6px 0 rgba(0,0,0,.108)'
                        }
                    }}
                >
                    <ColorPicker
                        color={tempColor}
                        onChange={handleColorPickerChange}
                        alphaType="none"
                        showPreview={true}
                        styles={{
                            panel: { padding: 0 },
                            root: { maxWidth: 280 }
                        }}
                    />
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        marginTop: '16px',
                        borderTop: '1px solid #edebe9',
                        paddingTop: '16px'
                    }}>
                        <DefaultButton text="Cancel" onClick={handleCancel} />
                        <PrimaryButton text="OK" onClick={handleOk} />
                    </div>
                </Callout>
            )}
        </div>
    );
};
