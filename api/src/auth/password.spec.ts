import { pbkdf2Sync } from 'crypto';
import { createPassword, verifyPassword } from './password';

describe('password storage', () => {
  it('uses a unique salt and validates the password', async () => {
    const first = await createPassword('correct-password');
    const second = await createPassword('correct-password');
    expect(first.hash).not.toBe(second.hash);
    expect(
      await verifyPassword('correct-password', first.salt, first.hash),
    ).toBe(true);
    expect(await verifyPassword('wrong-password', first.salt, first.hash)).toBe(
      false,
    );
  });

  it('supports original account hashes without accepting malformed ones', async () => {
    const salt = 'legacy-salt';
    const hash = pbkdf2Sync('old-password', salt, 1000, 64, 'sha512').toString(
      'hex',
    );
    expect(await verifyPassword('old-password', salt, hash)).toBe(true);
    expect(await verifyPassword('wrong-password', salt, hash)).toBe(false);
    expect(await verifyPassword('admin', 'admin', 'admin')).toBe(false);
  });
});
