declare module "react-native-htmlview" {
  import { ComponentType } from "react";
  import { StyleProp, TextStyle, ViewStyle } from "react-native";

  interface HTMLViewProps {
    value: string;
    stylesheet?: {
      [key: string]: StyleProp<TextStyle | ViewStyle>;
    };
    renderNode?: (
      node: any,
      index: number,
      siblings: any,
      parent: any,
      defaultRenderer: (node: any, parent: any) => any
    ) => any;
    onLinkPress?: (url: string) => void;
    onError?: (error: Error) => void;
    RootComponent?: ComponentType<any>;
    textComponentProps?: any;
    NodeComponent?: ComponentType<any>;
    style?: StyleProp<ViewStyle>;
  }

  const HTMLView: ComponentType<HTMLViewProps>;
  export default HTMLView;
}
