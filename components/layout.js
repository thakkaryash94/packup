import Head from 'next/head'
import '@zendeskgarden/react-grid/dist/styles.css'
import '@zendeskgarden/react-textfields/dist/styles.css'
import '@zendeskgarden/react-buttons/dist/styles.css'
import { ThemeProvider } from '@zendeskgarden/react-theming'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  }
`

export default ({ children, title = 'Package Updater' }) => (
  <ThemeProvider>
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" key="viewport" />
      </Head>
      <GlobalStyle />
      {children}
    </>
  </ThemeProvider>
)