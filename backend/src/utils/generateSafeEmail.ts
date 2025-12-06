
export function generateSafeEmail(email: string) {
    const [name,domain] = email.split('@')
    return `${name}+${Date.now()}@${domain}`;
}
  
  