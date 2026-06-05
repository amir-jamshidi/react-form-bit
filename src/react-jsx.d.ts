import type { ReactElement } from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    type Element = ReactElement<any, any>;
  }
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    type Element = ReactElement<any, any>;
  }
}

declare module "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    type Element = ReactElement<any, any>;
  }
}
