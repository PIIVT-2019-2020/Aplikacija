import { CanActivate, Injectable, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RoleCheckedGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const role: "administrator" | "user" = req.token.role;

        const allowedToRoles = this
            .reflector
            .get<("administrator" | "user")[]>('allow_to_roles', context.getHandler());

        return allowedToRoles.includes(role);

        // false - NE dozvoljava se izvrsavanje API metoda
        // true  - DOZVOLJAVA se izvrsavanje API metoda
        // throw ... - NE dozvoljava se, ali se greska salje kao odgovor servera HttpError...
    }
}
