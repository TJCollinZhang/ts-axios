const cookie = {
  read(name: string): string | null {
    // 正则解释：
    // (^|;\\s*) 匹配开头符或者分号，接着是\\s*不定数空格匹配
    // ([^;]*) [^]代表不包含，不包含分号的字符，匹配不定数次
    const match = document.cookie.match(new RegExp(`(^|;\\s*)(${name})=([^;]*)`))
    return match ? decodeURIComponent(match[3]) : null
  }
}

export default cookie
