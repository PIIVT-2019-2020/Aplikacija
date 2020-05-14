export class LoginInformationAdministratorDto {
    administratorId: number;
    username: string;
    token: string;

    constructor(aId: number, un: string, t: string) {
        this.administratorId = aId;
        this.username = un;
        this.token = t;
    }
}
