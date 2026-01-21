import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IPropertyPaneField, PropertyPaneFieldType, IPropertyPaneCustomFieldProps } from '@microsoft/sp-property-pane';
import { TextField, IconButton, Callout, DirectionalHint, PrimaryButton, DefaultButton, ColorPicker, IColor } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';

// ==================== React Component ====================

interface IColorPickerFieldInternalProps {
    label: string;
    value: string;
    onChanged: (color: string) => void;
    disabled?: boolean;
}

const ColorPickerFieldInternal: React.FC<IColorPickerFieldInternalProps> = (props) => {
    const [color, setColor] = React.useState<string>(props.value || '#000000');
    const [tempColor, setTempColor] = React.useState<string>(props.value || '#000000');
    const [isCalloutVisible, { toggle: toggleCallout, setFalse: hideCallout }] = useBoolean(false);
    const [buttonId] = React.useState<string>(() => 'color-picker-' + Math.random().toString(36).substr(2, 9));

    React.useEffect(() => {
        if (props.value !== color) {
            setColor(props.value || '#000000');
            setTempColor(props.value || '#000000');
        }
    }, [props.value]);

    const handleTextChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        const val = newValue || '';
        setColor(val);
        if (/^#[0-9A-Fa-f]{6}$/i.test(val)) {
            props.onChanged(val);
        }
    };

    const handleColorPickerChange = (ev: React.SyntheticEvent<HTMLElement>, colorObj: IColor): void => {
        setTempColor('#' + colorObj.hex);
    };

    const handleOk = (): void => {
        setColor(tempColor);
        props.onChanged(tempColor);
        hideCallout();
    };

    const handleCancel = (): void => {
        setTempColor(color);
        hideCallout();
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 600, fontSize: '14px', color: '#323130' }}>
                {props.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                    style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: /^#[0-9A-Fa-f]{6}$/i.test(color) ? color : '#ffffff',
                        border: '1px solid #8a8886',
                        borderRadius: '4px',
                        flexShrink: 0
                    }}
                />
                <TextField
                    value={color}
                    onChange={handleTextChange}
                    placeholder="#000000"
                    styles={{
                        root: { width: '110px' },
                        field: { fontFamily: 'Consolas, monospace', fontSize: '14px' }
                    }}
                    disabled={props.disabled}
                />
                <IconButton
                    id={buttonId}
                    iconProps={{ iconName: 'Color' }}
                    title="Color Picker öffnen"
                    onClick={toggleCallout}
                    disabled={props.disabled}
                    styles={{
                        root: { backgroundColor: '#f3f2f1', border: '1px solid #8a8886', borderRadius: '4px', width: '32px', height: '32px' },
                        rootHovered: { backgroundColor: '#edebe9' }
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
                    styles={{ root: { padding: '16px', boxShadow: '0 6.4px 14.4px 0 rgba(0,0,0,.132), 0 1.2px 3.6px 0 rgba(0,0,0,.108)' } }}
                >
                    <ColorPicker
                        color={tempColor}
                        onChange={handleColorPickerChange}
                        alphaType="none"
                        showPreview={true}
                        styles={{ panel: { padding: 0 }, root: { maxWidth: 280 } }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', borderTop: '1px solid #edebe9', paddingTop: '16px' }}>
                        <DefaultButton text="Abbrechen" onClick={handleCancel} />
                        <PrimaryButton text="OK" onClick={handleOk} />
                    </div>
                </Callout>
            )}
        </div>
    );
};

// ==================== Property Pane Control ====================

export interface IPropertyPaneColorPickerFieldProps {
    key: string;
    label: string;
    value: string;
    onPropertyChange: (propertyPath: string, newValue: string) => void;
    disabled?: boolean;
}

interface IPropertyPaneColorPickerFieldInternalProps extends IPropertyPaneCustomFieldProps {
    key: string;
    label: string;
    value: string;
    onPropertyChange: (propertyPath: string, newValue: string) => void;
    disabled?: boolean;
    targetProperty: string;
}

class PropertyPaneColorPickerFieldBuilder implements IPropertyPaneField<IPropertyPaneColorPickerFieldInternalProps> {
    public type: PropertyPaneFieldType = PropertyPaneFieldType.Custom;
    public targetProperty: string;
    public properties: IPropertyPaneColorPickerFieldInternalProps;
    private elem?: HTMLElement;

    constructor(targetProperty: string, props: IPropertyPaneColorPickerFieldProps) {
        this.targetProperty = targetProperty;
        this.properties = {
            key: props.key,
            label: props.label,
            value: props.value,
            onPropertyChange: props.onPropertyChange,
            disabled: props.disabled,
            targetProperty: targetProperty,
            onRender: this.onRender.bind(this),
            onDispose: this.onDispose.bind(this)
        };
    }

    private onRender(elem: HTMLElement): void {
        if (!this.elem) {
            this.elem = elem;
        }

        const element = React.createElement(ColorPickerFieldInternal, {
            label: this.properties.label,
            value: this.properties.value,
            onChanged: this.onChanged.bind(this),
            disabled: this.properties.disabled
        });

        ReactDOM.render(element, elem);
    }

    private onDispose(elem: HTMLElement): void {
        ReactDOM.unmountComponentAtNode(elem);
    }

    private onChanged(color: string): void {
        this.properties.onPropertyChange(this.targetProperty, color);
    }
}

export function PropertyPaneColorPickerField(
    targetProperty: string,
    props: IPropertyPaneColorPickerFieldProps
): IPropertyPaneField<IPropertyPaneColorPickerFieldInternalProps> {
    return new PropertyPaneColorPickerFieldBuilder(targetProperty, props);
}
