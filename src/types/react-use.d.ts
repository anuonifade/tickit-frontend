declare module 'react-use/lib/useWindowSize' {
  interface WindowSize {
    width: number;
    height: number;
  }

  export default function useWindowSize(): WindowSize;
}
