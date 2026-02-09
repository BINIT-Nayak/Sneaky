type Modifiers = Record<string, boolean | undefined>;

export const useClasses = (
  styles: Record<string, string>,
  block: string,
  modifiers?: Modifiers,
  extra?: string,
) => {
  const classes: string[] = [];

  // base class from module
  if (styles[block]) {
    classes.push(styles[block]);
  }

  // modifiers
  if (modifiers) {
    Object.entries(modifiers).forEach(([key, value]) => {
      if (value) {
        const modKey = `${block}_${key}`; 
        if (styles[modKey]) {
          classes.push(styles[modKey]);
        }
      }
    });
  }

  // external className
  if (extra) {
    classes.push(extra);
  }

  return classes.join(" ");
};
