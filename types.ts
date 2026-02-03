export interface Slide {
  id: number
  thumbnail: string
  full: string
  highRes: string
}

export interface Section {
  title: string
  startSlide: number
  level: number // 0 = main section, 1 = subsection, 2 = sub-subsection
}

export interface Author {
  name: string
  bio: string
  photo: string
  twitter?: string
  linkedin?: string
  website?: string
}
