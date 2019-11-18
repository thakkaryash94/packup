import Head from 'next/head'
import { theme } from '@primer/components'
import { ThemeProvider } from 'styled-components'

const customTheme = {
  ...theme,
  space: [0, 8, 16, 32, 64],
  fontSizes: [10, 12, 16, 24, 48]
}
// override
theme.colors.bodytext = '#111'

export default ({ children, title = 'Package Updater' }) => (
  <ThemeProvider theme={Object.assign({}, theme, customTheme)}>
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" key="viewport" />
      </Head>
      {children}
    </>
  </ThemeProvider>
)
