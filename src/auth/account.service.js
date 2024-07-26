import axios from 'axios';
import { Observable } from 'rxjs/Observable';
import settings from '../settings';

const AccountService = {
    register(userRegistration) {
        return Observable.fromPromise(axios.post(`${settings.securityApi}/accounts`, userRegistration))
            .map((res) => true)
            .catch((error) => this.handleError(error.response));
    }
}
// export a singleton instance in the global namespace
export { AccountService }
