import { ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER, ICourierProvider } from "../const";
import { PaperflyProvider } from "./paperfly.provider";
import { PathaoProvider } from "./pathao.provider";
import { SteadfastProvider } from "./steadfast.provider";

export class CourierFactory {

    static getProvider(uniqueIdentifier: string): ICourierProvider {

        switch (uniqueIdentifier) {

            case ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER.PAPERFLY:
                return new PaperflyProvider();

            case ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER.STEADFAST:
                return new SteadfastProvider();

            case ENUM_SERVICE_PROVIDER_UNIQUE_IDENTIFIER.PATHAO:
                return new PathaoProvider();

            default:
                throw new Error("Courier provider not supported");
        }
    }
}