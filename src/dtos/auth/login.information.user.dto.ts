export class LoginInformationUserDto {
    userId: number;
    email: string;
    token: string;

    constructor(uId: number, em: string, t: string) {
        this.userId = uId;
        this.email = em;
        this.token = t;
    }
}
