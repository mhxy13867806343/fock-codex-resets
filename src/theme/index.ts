import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#ff5c2b',
    primaryColorHover: '#ee4518',
    primaryColorPressed: '#d83a10',
    primaryColorSuppl: '#ff5c2b',
    borderRadius: '10px',
    fontFamily: '"Baloo 2", system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'ui-monospace, "JetBrains Mono", monospace',
    bodyColor: '#fff4dd',
    cardColor: '#fffdf7',
    textColorBase: '#26201a',
    textColor1: '#26201a',
    textColor2: '#5c5347',
    textColor3: '#877b6b',
    borderColor: '#26201a',
  },
  Button: {
    textColor: '#26201a',
    border: '2px solid #26201a',
    borderRadiusMedium: '10px',
    fontWeight: '700',
    boxShadow: '2px 2px 0 #26201a',
  },
  Card: {
    borderColor: '#26201a',
    borderRadius: '14px',
    boxShadow: '4px 4px 0 #26201a',
  },
  Tooltip: {
    color: '#26201a',
    textColor: '#fff4dd',
    borderRadius: '8px',
  },
  Input: {
    border: '2px solid #26201a',
    borderRadius: '999px',
    boxShadow: '2px 2px 0 #26201a',
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#ff5c2b',
    primaryColorHover: '#ff774d',
    primaryColorPressed: '#ee4518',
    primaryColorSuppl: '#ff5c2b',
    borderRadius: '10px',
    fontFamily: '"Baloo 2", system-ui, -apple-system, sans-serif',
    fontFamilyMono: 'ui-monospace, "JetBrains Mono", monospace',
    bodyColor: '#17130f',
    cardColor: '#241e19',
    textColorBase: '#f4ede4',
    textColor1: '#f4ede4',
    textColor2: '#c9bfb4',
    textColor3: '#9e9286',
    borderColor: '#4d4236',
  },
  Button: {
    textColor: '#f4ede4',
    border: '2px solid #4d4236',
    borderRadiusMedium: '10px',
    fontWeight: '700',
    boxShadow: '2px 2px 0 #0d0a08',
  },
  Card: {
    borderColor: '#4d4236',
    borderRadius: '14px',
    boxShadow: '4px 4px 0 #0d0a08',
  },
  Tooltip: {
    color: '#0d0a08',
    textColor: '#f4ede4',
    borderRadius: '8px',
  },
  Input: {
    border: '2px solid #4d4236',
    borderRadius: '999px',
    boxShadow: '2px 2px 0 #0d0a08',
  },
};
