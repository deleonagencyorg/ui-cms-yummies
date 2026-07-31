import 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'lite-youtube': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          videoid?: string
          playlabel?: string
          params?: string
        },
        HTMLElement
      >
    }
  }
}

declare module 'lite-youtube-embed'
declare module 'lite-youtube-embed/src/lite-yt-embed.css'
