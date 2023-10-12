import crypto from 'crypto';

export class Sha256 {
  CHARS: string[];
  SALT_LENGTH: number;

  constructor() {
    this.CHARS = this.initCharRange();
    this.SALT_LENGTH = 16;
  }

  isValidPassword(password: string, hash: string) {
    const parts = hash.split('$');
    return parts.length === 4 && hash === this.hash(password, parts[2]);
  }

  hash(password: string, salt = this.generateSalt()) {
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    const finalHash = crypto
      .createHash('sha256')
      .update(hashedPassword + salt)
      .digest('hex');
    return `$SHA$${salt}$${finalHash}`;
  }

  generateSalt() {
    let salt = '';
    for (let i = 0; i < this.SALT_LENGTH; ++i) {
      const randomCharIndex = Math.floor(Math.random() * this.CHARS.length);
      salt += this.CHARS[randomCharIndex];
    }
    return salt;
  }

  initCharRange() {
    const chars = [];
    for (let i = 0; i <= 9; ++i) {
      chars.push(i.toString());
    }
    for (let charCode = 97; charCode <= 102; ++charCode) {
      chars.push(String.fromCharCode(charCode));
    }
    return chars;
  }
}
