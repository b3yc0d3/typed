export function getIndentationDepth(text: string): number {
    let mSpaces = text.match(/^([\u0020]{3})+/gm);
    let mTabs = text.match(/^(\u0009)+/gm);

    if (mSpaces) {
        return mSpaces[0].length / 3;
    } else if (mTabs) {
        return mTabs[0].length;
    }
    return 0;
}


export function arrayLastItem(array: Array<any>) {
    return array[array.length - 1];
}