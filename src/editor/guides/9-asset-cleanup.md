# 애셋 정리

사용자가 추가했지만 더 이상 필요하지 않은 애셋을 정리하는 것은 사용자의 책임입니다.
애셋들은 S3 스토리지 버킷과 로컬 IndexedDB 애셋 캐시에 남아있을 수 있습니다.

## 애셋을 안전하게 삭제할 수 있는 시점

사용자가 애셋을 삭제해도, <kbd>Cmd</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd>를 눌러 삭제를 실행 취소할 수 있습니다.
애셋이 [실행 취소 스택](/docs/editor-starter/undo-redo)에서 참조되고 있는 한, 삭제하는 것은 안전하지 않습니다.

애셋을 정리하려면, 실행 취소 스택이 깨끗한지 확인하거나 실행 취소 스택을 지워야 합니다.

## 삭제된 애셋 가져오기

애셋이 삭제되면, [`undoableState`](/docs/editor-starter/state-management)의 일부인 `deletedAssets` 배열에 추가됩니다.
위에서 언급한 대로, 먼저 사용자가 삭제를 실행 취소할 수 없도록 해야 합니다.

## 애셋 삭제

### IndexedDB에서 애셋 삭제

`deletedAssets` 배열의 객체에서 `assetId`가 있다면, [`deleteCachedAsset`](https://github.com/remotion-dev/editor-starter/blob/9fdd35812f8505273edf29f207dd9d021c901491/src/editor/caching/indexeddb.ts#L92) 메서드를 호출하여 IndexedDB에서 삭제할 수 있습니다.

### S3에서 애셋 삭제

`deletedAssets` 배열의 객체에서 `remoteFileKey`가 있다면, 다음 코드를 사용하여 S3에서 삭제할 수 있습니다:

```ts
import {getAwsClient} from '@remotion/lambda/client';
import {requireServerEnv} from '../../editor/utils/server-env';

const {REMOTION_AWS_BUCKET_NAME, REMOTION_AWS_REGION} = requireServerEnv();

const {client, sdk} = getAwsClient({
  region: REMOTION_AWS_REGION,
  service: 's3',
});

const command = new sdk.DeleteObjectCommand({
  Bucket: REMOTION_AWS_BUCKET_NAME,
  Key: remoteFileKey,
});

await client.send(command);
```

`assetStatus`가 `uploaded`인 애셋만 정리하면 됩니다.

### 상태에서 제거

S3와 IndexedDB에서 애셋이 성공적으로 삭제되면, [`clearDeletedAsset()`](https://github.com/remotion-dev/editor-starter/blob/main/src/editor/state/actions/clear-deleted-asset.ts) 메서드를 호출하여 상태에서 제거할 수 있습니다.

## 참조

- [애셋 업로드](/docs/editor-starter/asset-uploads)
- [지속성](/docs/editor-starter/persistance)