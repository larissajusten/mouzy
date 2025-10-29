import type { Preview } from "@storybook/react";
import "../client/src/index.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0a0a0a',
        },
        {
          name: 'game-bg',
          value: 'linear-gradient(to bottom right, rgba(168, 85, 247, 0.2), rgba(255, 255, 255, 0), rgba(251, 146, 60, 0.2))',
        },
      ],
    },
  },
};

export default preview;
