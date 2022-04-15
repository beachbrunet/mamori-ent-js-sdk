
import { MamoriService } from './api';
import { DB_PERMISSION } from './permission';

export class ServerSession {
    public static setPassthrough(api: MamoriService, datasourceName: string): Promise<any> {
        //
        //Passing in the option with a connection name causes it to not apply passthrough mode
        //let connectionName = datasourceName + Date.now();
        //{ cxnname: connectionName }

        let SQL = "set " + DB_PERMISSION.PASSTHROUGH + " '" + datasourceName + "' true";
        return api.simple_query(SQL).then(result => {
            return { errors: false, result: result };
        })
    }
} 