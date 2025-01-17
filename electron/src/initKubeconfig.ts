import path from 'path';
import {AnyAction} from 'redux';

import {AlertEnum} from '@models/alert';

import {setAlert} from '@redux/reducers/alert';
import {updateKubeconfig, updateKubeconfigPathValidity} from '@redux/reducers/appConfig';
import {onUserPerformedClickOnClusterIcon} from '@redux/reducers/uiCoach';
import {monitorKubeConfig} from '@redux/services/kubeConfigMonitor';

import electronStore from '@utils/electronStore';
import {PROCESS_ENV} from '@utils/env';

function initKubeconfig(dispatch: (action: AnyAction) => void, userHomeDir: string) {
  if (PROCESS_ENV.KUBECONFIG) {
    const envKubeconfigParts = PROCESS_ENV.KUBECONFIG.split(path.delimiter);
    if (envKubeconfigParts.length > 1) {
      dispatch(updateKubeconfig(envKubeconfigParts[0]));
      monitorKubeConfig(envKubeconfigParts[0], dispatch);

      dispatch(
        setAlert({
          title: 'KUBECONFIG warning',
          message: 'Found multiple configs, selected the first one.',
          type: AlertEnum.Warning,
        })
      );
    } else {
      dispatch(updateKubeconfig(PROCESS_ENV.KUBECONFIG));
      monitorKubeConfig(PROCESS_ENV.KUBECONFIG, dispatch);
    }
    return;
  }
  const storedKubeconfig: string | undefined = electronStore.get('appConfig.kubeconfig');
  const storedIsKubeconfigPathValid: boolean = electronStore.get('appConfig.isKubeconfigPathValid');
  const hasUserPerformedClickOnClusterIcon: boolean = electronStore.get('appConfig.hasUserPerformedClickOnClusterIcon');

  if (hasUserPerformedClickOnClusterIcon) {
    dispatch(onUserPerformedClickOnClusterIcon());
  }

  if (storedKubeconfig && storedKubeconfig.trim().length > 0) {
    dispatch(updateKubeconfig(storedKubeconfig));
    monitorKubeConfig(storedKubeconfig, dispatch);
    dispatch(updateKubeconfigPathValidity(storedIsKubeconfigPathValid));
    return;
  }

  const possibleKubeconfig = path.join(userHomeDir, `${path.sep}.kube${path.sep}config`);
  dispatch(updateKubeconfig(possibleKubeconfig));
  monitorKubeConfig(possibleKubeconfig, dispatch);
  dispatch(updateKubeconfigPathValidity(true));
}

export default initKubeconfig;
