# Production Checklist

출시할 준비가 되셨나요? 축하합니다!  
프로젝트를 production에 배포하기 전에 확인해야 할 몇 가지 사항들입니다.

## 보호된 endpoint들

애셋, 자막, 렌더링을 위한 [백엔드 라우트](/docs/editor-starter/backend-routes)들은 우리 템플릿에서 어떤 인증이나 rate limit으로도 보호되지 않습니다.  
남용을 방지하기 위해 필요한 보호 조치를 구현했나요?

## 애셋 정리

기본적으로 삭제된 애셋들은 자동으로 정리되지 않습니다.  
[애셋 정리](/docs/editor-starter/asset-cleanup)를 구현했나요?

## Lambda checklist

Remotion Lambda 통합을 위한 별도의 [Lambda checklist](/docs/lambda/checklist)가 있습니다.

## 포함되지 않은 기능들

필요한 중요한 기능들이 누락되었는지 [포함되지 않은 기능들](/docs/editor-starter/features-not-included)을 확인했나요?

## 의도하지 않은 기능들

배포 중인 기능 중에 모르는 기능이 있는지 [기능들](/docs/editor-starter/features)을 확인했나요? 필요하지 않다면 비활성화하세요.

## AWS 자동 배포

배포할 때마다 AWS 인프라도 업데이트된다는 점을 알아두세요.  
[production 배포와 development 배포를 분리하여 더욱 견고하게 만드세요](/docs/editor-starter/rendering#auto-deployment-of-aws-infrastructure).

## 제한사항들

기본적으로 [업로드할 수 있는 파일 크기](/docs/editor-starter/asset-uploads#limits)와 [자막을 넣을 수 있는 비디오 길이](/docs/editor-starter/captioning#limits)에 제한이 있다는 걸 알고 있었나요?

필요하다면 다르게 처리하세요.

## Company License

무료 라이센스를 받을 자격이 없는 회사라면 [Remotion Company License](/docs/license)를 구매했나요?

---

프로젝트를 production에 배포하게 된다면 축하드립니다!  
[Discord](https://remotion.dev/discord)의 `#showcase` 채널에 여러분의 제품을 게시하세요.