import { once, showUI } from '@create-figma-plugin/utilities';

import { type CloseHandler, type CreateRectanglesHandler } from './types';

export default async function() {
    once<CreateRectanglesHandler>('CREATE_RECTANGLES', function(count: number) {
        const nodes: Array<SceneNode> = [];
        for (let i = 0; i < count; i++) {
            const rect = figma.createRectangle();
            rect.x = i * 150;
            rect.fills = [
                {
                    color: { b: 0, g: 0.5, r: 1 },
                    type: 'SOLID',
                },
            ];
            figma.currentPage.appendChild(rect);
            nodes.push(rect);
        }
        figma.currentPage.selection = nodes;
        figma.viewport.scrollAndZoomIntoView(nodes);
        figma.closePlugin();
    });

    const b = await figma.getLocalPaintStylesAsync();
    const c = await figma.variables.getLocalVariableCollectionsAsync();
    const v = await figma.variables.getLocalVariablesAsync();

    console.log({ b, c, v });
    once<CloseHandler>('CLOSE', function() {
        figma.closePlugin();
    });
    showUI({
        height: 200,
        width: 240,
    });
}