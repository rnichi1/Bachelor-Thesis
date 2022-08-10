import {CSSProperties} from "react";

export type GuiState = {
    widgets: Widget[] | Widget;
};

export type Widget = {
    route: string;
    width: number;
    height:number;
    xpos: number;
    ypos: number;
    style: CSSProperties | undefined
}
