import { Primitive, createPrimitive, type AttributesFor } from '../primitive/index.js';

/* -------------------------------------------------------------------------------------------------
 * ButtonPrimitive
 * -----------------------------------------------------------------------------------------------*/

type ButtonProps = { disabled?: boolean };

class ButtonPrimitive extends Primitive<ButtonProps> {
  static tag = 'button' as const;
  static attribute: string = 'mlk-button';
  static defaultAttributes: AttributesFor<typeof ButtonPrimitive.tag> | null = { type: 'button' };
  static props: readonly string[] = ['disabled'] satisfies readonly (keyof ButtonProps)[];

  static initialProps(element: HTMLElement): Partial<ButtonProps> {
    return { disabled: element.hasAttribute('disabled') };
  }

  protected override render() {
    return { attributes: { disabled: this.props.disabled || undefined } };
  }
}

const Button = /*#__PURE__*/ createPrimitive(ButtonPrimitive);

/* ---------------------------------------------------------------------------------------------- */

export type { ButtonProps };
export { Button };
