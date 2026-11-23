const base = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "currentColor" };
const make = (d) =>
  function Icon(props) {
    return (
      <svg {...base} {...props}>
        <path d={d} />
      </svg>
    );
  };

export const IconHome = make("M12 3 2 12h3v8h5v-5h4v5h5v-8h3L12 3z");
export const IconSearch = make(
  "M10.5 3a7.5 7.5 0 0 1 5.9 12.1l4.3 4.3-1.4 1.4-4.3-4.3A7.5 7.5 0 1 1 10.5 3zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11z"
);
export const IconLibrary = make("M4 4h2v16H4zM9 4h2v16H9zM14.2 5.1l1.9-.6 4 14.9-1.9.5z");
export const IconHeart = make(
  "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
);
export const IconHeartOutline = make(
  "M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
);
export const IconPlay = make("M8 5v14l11-7z");
export const IconPause = make("M6 5h4v14H6zM14 5h4v14h-4z");
export const IconPrev = make("M6 6h2v12H6zm3.5 6 8.5 6V6z");
export const IconNext = make("M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z");
export const IconShuffle = make(
  "M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"
);
export const IconRepeat = make("M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z");
export const IconRepeatOne = make(
  "M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"
);
export const IconVolume = make(
  "M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
);
export const IconVolumeMute = make(
  "M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.8 8.8 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"
);
export const IconChevronLeft = make("M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z");
export const IconChevronRight = make("M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z");
export const IconPlus = make("M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z");
export const IconClose = make(
  "M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
);
export const IconNote = make(
  "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"
);
export const IconMenu = make("M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z");