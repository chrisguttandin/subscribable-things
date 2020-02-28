import { TPermissionStateFactory } from '../types';

export const createPermissionState: TPermissionStateFactory = (window, wrapSubscribeFunction) => {
    return (permissionDescriptor) => wrapSubscribeFunction((observer) => {
        let isActive = true;
        let unsubscribe = () => { isActive = false; };

        window.navigator.permissions
            .query(permissionDescriptor)
            .then((permissionStatus) => {
                if (isActive) {
                    observer.next(permissionStatus.state);

                    permissionStatus.onchange = () => observer.next(permissionStatus.state);

                    unsubscribe = () => { permissionStatus.onchange = null; };
                }
            })
            .catch((err) => {
                if (isActive) {
                    observer.error(err);
                }
            });

        return () => unsubscribe();
    });
};
