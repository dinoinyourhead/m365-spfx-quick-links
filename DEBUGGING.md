# Debugging SPFx Z-Index Issues

The Z-Index issue suggests a "Stacking Context" conflict where the **File Picker** is being trapped inside a layer that is *behind* the **Manage Links** panel.

Please follow these steps to identify the conflict in your browser.

## 1. Open Developer Tools
- Open the Workbench in Chrome or Edge.
- Press **F12** or right-click anywhere and select **Inspect**.

## 2. Locate the Elements
You need to find the HTML elements for both the "Manage Links" panel and the "File Picker" panel.

1.  **Open the Quick Links Property Pane** and click **"Manage Links"**.
2.  **Click "Select Logo"** to open the (hidden) picker.
3.  In DevTools **Elements** tab, click inside the HTML code area and press `Ctrl+F` (Windows) or `Cmd+F` (Mac).
4.  Search for: `quick-links-file-picker-panel` (This is the class I added to the File Picker).
    - If you find it, hover over it. You might see a blue highlight somewhere on the screen (possibly behind the other panel).

## 3. Compare Z-Indexes
We need to compare the "Computed" Z-Index of the **Layers** that hold these panels.

### Check the File Picker Layer
1.  From the `quick-links-file-picker-panel` element, look **up** the tree for the closest parent showing `<div class="ms-Layer ...">`.
2.  Click that `ms-Layer` element.
3.  Go to the **Computed** tab (in the Styles pane on the right).
4.  Filter for `z-index`.
    - **Value**: _________ (We expect `2147483647` from my fix).

### Check the Manage Links Layer
1.  Now search for `quick-links-collection-data-panel`.
2.  Look **up** the tree for *its* closest parent `<div class="ms-Layer ...">`.
3.  Click that `ms-Layer`.
4.  Check its **Computed** `z-index`.
    - **Value**: _________

## 4. The Stacking Context Trap
If the File Picker's Z-Index is huge, but it's still hidden, it means its **Parent** is trapped.

- Look at the `ms-Layer` of the **File Picker** again.
- Is it a **child** of the `ms-Layer` of the **Manage Links** panel?
    - **Yes**: The File Picker is inside the Manage Links panel. If the Manage Links panel has `overflow: hidden` or similar, it might clip the popup.
    - **No** (They are siblings): Browser rendering order matters. The one lower in the HTML code usually wins if z-index is equal.

## 5. Console Test
Copy and paste this into the **Console** tab and press Enter. It will try to log the specific Z-indexes for you:

```javascript
(function() {
    const pickerClass = 'quick-links-file-picker-panel';
    const collectionClass = 'quick-links-collection-data-panel';
    
    const pickerNode = document.querySelector('.' + pickerClass);
    const collectionNode = document.querySelector('.' + collectionClass);
    
    console.log('--- Debugging Z-Index ---');
    
    if (pickerNode) {
        const pickerLayer = pickerNode.closest('.ms-Layer');
        console.log('Picker Found:', pickerNode);
        console.log('Picker Layer:', pickerLayer);
        if (pickerLayer) console.log('Picker Layer Z-Index:', getComputedStyle(pickerLayer).zIndex);
    } else {
        console.error('Picker NOT found in DOM. Is it open?');
    }

    if (collectionNode) {
        const collectionLayer = collectionNode.closest('.ms-Layer');
        console.log('Collection Panel Found:', collectionNode);
        console.log('Collection Layer:', collectionLayer);
        if (collectionLayer) console.log('Collection Layer Z-Index:', getComputedStyle(collectionLayer).zIndex);
    }
})();
```

**Let me know what you find!** Specifically the Z-Index values and if one Layer is inside the other.
