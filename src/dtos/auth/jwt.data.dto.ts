export class JwtDataDto {
    id: number;
    identity: string;
    exp: number;
    ip: string;
    ua: string;
    role: "administrator" | "user";

    toPlainObject() {
        return {
            id: this.id,
            identity: this.identity,
            exp: this.exp,
            ip: this.ip,
            ua: this.ua,
            role: this.role,
        }
    }
}
