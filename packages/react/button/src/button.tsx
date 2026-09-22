import { Button as NativeButton } from '@milkui/button';
import { createReactComponent } from '@milkui/react-primitive';
import type { ComponentProps } from 'react';

/* -------------------------------------------------------------------------------------------------
 * Button
 * -----------------------------------------------------------------------------------------------*/

const Button = /*#__PURE__*/ createReactComponent(NativeButton);
const Root = Button;
type ButtonProps = ComponentProps<typeof Button>;
type RootProps = ButtonProps;

/* ---------------------------------------------------------------------------------------------- */

export { Button, Root };
export type { ButtonProps, RootProps };
