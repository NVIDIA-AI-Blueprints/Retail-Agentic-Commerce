import * as react_jsx_runtime from 'react/jsx-runtime';

interface NebulaCommonProps {
    /**
     * Css classes to merge with existing root level classes.
     */
    className?: string;
}
interface NebulaSphereVariant extends NebulaCommonProps {
    /**
     * "sphere" variant has a center point that is center positioned
     * automatically within its parent container.
     */
    variant: "sphere";
    /**
     * X offset from center of nebula sphere.
     */
    x?: number;
    /**
     * Y offset from center of nebula sphere.
     */
    y?: number;
    /**
     * Max size that particles will try conform to when animating.
     */
    sphereSize?: number;
}
interface NebulaAmbientVariant extends NebulaCommonProps {
    /**
     * "ambient" variant takes full size of its parent container.
     */
    variant: "ambient";
}
type NebulaProps = NebulaSphereVariant | NebulaAmbientVariant;
declare const Nebula: ({ variant, className, ...props }: NebulaProps) => react_jsx_runtime.JSX.Element;

export { Nebula, type NebulaAmbientVariant, type NebulaCommonProps, type NebulaProps, type NebulaSphereVariant };
