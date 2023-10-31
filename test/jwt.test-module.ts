import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "../src/auth/constants";

const jwtModule = JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: {expiresIn: "60s"}
});

// export jwtModule
export {jwtModule};
