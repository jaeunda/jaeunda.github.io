import { QuartzPluginData } from "../plugins/vfile"

export function isUnlisted(fileData: QuartzPluginData): boolean {
  const value = fileData.frontmatter?.unlisted
  return value === true || value === "true"
}

export function listedFiles(files: QuartzPluginData[]): QuartzPluginData[] {
  return files.filter((file) => !isUnlisted(file))
}
