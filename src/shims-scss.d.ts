/***
 * Tell TypeScript that any import ending with *.module.scss* returns an
 * object whose keys are the original class names and whose values are the
 * generated (hashed) class names.
 *
 * Example:
 *   import styles from '@/styles/card-styles.module.scss';
 *   // styles is of type Record<string, string>
 ***/
declare module '*.module.scss' {
  const classes: Record<string, string>;
  export default classes;
}
