import React, {useCallback, useMemo} from 'react';

import {Button} from 'antd';

import {PlusOutlined} from '@ant-design/icons';

import styled from 'styled-components';

import {ROOT_FILE_ENTRY} from '@constants/constants';

import {SectionCustomComponentProps} from '@models/navigator';
import {NewResourceWizardInput} from '@models/ui';

import {useAppDispatch, useAppSelector} from '@redux/hooks';
import {openNewResourceWizard} from '@redux/reducers/ui';
import {isInPreviewModeSelector} from '@redux/selectors';

import {ResourceKindHandlers, getResourceKindHandler} from '@src/kindhandlers';

const KnownResourceKinds = ResourceKindHandlers.map(kindHandler => kindHandler.kind);

const SuffixContainer = styled.span`
  display: inline-block;
`;

const ButtonContainer = styled.span`
  display: flex;
  align-items: center;
  padding: 0 4px;
  margin-right: 2px;
  & .ant-btn-sm {
    height: 20px;
    width: 20px;
  }
`;

const ResourceKindSectionSuffix: React.FC<SectionCustomComponentProps> = props => {
  const {sectionInstance} = props;
  const dispatch = useAppDispatch();

  const isFolderOpen = useAppSelector(state => Boolean(state.main.fileMap[ROOT_FILE_ENTRY]));
  const isInPreviewMode = useAppSelector(isInPreviewModeSelector);

  const resourceKind = useMemo(() => {
    return sectionInstance.meta?.resourceKind;
  }, [sectionInstance]);

  const createResource = useCallback(() => {
    if (!resourceKind) {
      return;
    }
    const kindHandler = getResourceKindHandler(resourceKind);
    const input: NewResourceWizardInput = {
      kind: resourceKind,
      apiVersion: kindHandler?.clusterApiVersion,
    };
    dispatch(openNewResourceWizard({defaultInput: input}));
  }, [resourceKind, dispatch]);

  if (!resourceKind || !KnownResourceKinds.includes(resourceKind) || !isFolderOpen) {
    return null;
  }
  return (
    <SuffixContainer>
      <ButtonContainer>
        <Button icon={<PlusOutlined />} type="link" onClick={createResource} size="small" disabled={isInPreviewMode} />
      </ButtonContainer>
    </SuffixContainer>
  );
};

export default ResourceKindSectionSuffix;
