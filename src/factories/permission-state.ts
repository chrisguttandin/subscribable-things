import { TPermissionStateFactory } from '../types';

export const createPermissionState: TPermissionStateFactory = (emitNotSupportedError, window, wrapSubscribeFunction) => {
    return (permissionDescriptor) =>
        wrapSubscribeFunction((observer) => {
            if (
                window === null ||
                window.navigator === undefined ||
                window.navigator.permissions === undefined ||
                window.navigator.permissions.query === undefined
            ) {
                return emitNotSupportedError(observer);
            }

            let isActive = true;
            let unsubscribe = () => {
                isActive = false;
            };

            window.navigator.permissions.query(permissionDescriptor).then(
                (permissionStatus) => {
                    if (isActive) {
                        observer.next(permissionStatus.state);
                    }

                    if (isActive) {
                        permissionStatus.onchange = () => observer.next(permissionStatus.state);

                        unsubscribe = () => {
                            permissionStatus.onchange = null;
                        };
                    }
                },
                (err) => {
                    if (isActive) {
                        observer.error(err);
                    }
                }
            );

            return () => unsubscribe();
        });
};
