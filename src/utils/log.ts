import chalk from 'chalk';

export const orange = chalk.hex('#FFA500');
export const { white, red, yellow, green }: { [x: string]: any } = chalk;

export const log = (...a: any) => console.log(white(...a));
export const logError = (...a: any) => console.log(red(...a));
export const logWarn = (...a: any) => console.log(orange(...a));
