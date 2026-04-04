# Editor Starter 자주 묻는 질문

## 이것이 video editor인가요?

이것은 필수 기능들을 포함한 video editor를 구축하기 위한 시작점입니다 - 다른 누군가의 video editor 구축 미션을 jumpstart하기 위한 것입니다!

## 언제 Editor Starter를 구매해야 하나요?

video editor를 처음부터 구축하고 싶지 않다면 Editor Starter 구매를 고려해보세요.

[구매 전 확인사항](/docs/editor-starter/before-you-buy) 섹션을 읽고 모든 질문에 대한 답이 "예"인지 확인하세요.

우리는 Editor Starter가 여러분의 video editor를 시작하기 위한 훌륭한 선택이라고 생각하지만, Remotion을 사용하는 다른 옵션들도 있습니다:  
[Remotion으로 video editor를 처음부터 구축](/docs/building-a-timeline)하거나, 다른 [Remotion 기반 video editor를 구매](/docs/buy-a-video-editor)할 수도 있습니다.

## Editor Starter를 구매해도 여전히 Remotion Company License가 필요한가요?

Editor Starter는 Remotion을 사용하기 때문에, [Remotion License](/docs/license)를 준수해야 합니다.

요약: 4명 이상의 팀이나 회사는 [Remotion Company License](https://remotion.pro/license)를 취득해야 합니다 - 자세한 정보는 license를 확인하세요.

## Editor Starter를 기존 app에 통합할 수 있나요?

한 폴더를 기존 React project에 복사하고 Editor Starter의 frontend 부분을 즉시 작동시킬 수 있어야 합니다.

우리는 가장 인기 있는 스택을 가정합니다: React 19, TypeScript, TailwindCSS.

몇 가지 framework별 backend endpoint가 필요합니다.  
template 자체는 React Router 7 project입니다.  
우리는 또한 Next.js용 copy-paste 가능한 backend endpoint를 제공합니다.

기존 project에 Editor Starter를 통합하는 방법에 대한 더 나은 아이디어를 얻으려면 [Setup](/docs/editor-starter/setup) 및 [Dependencies](/docs/editor-starter/dependencies) 섹션을 읽어보세요.

## X 기능이 없는데, 추가해 주실 수 있나요?

[Features](/docs/editor-starter/features) 섹션에 나열되지 않은 기능들은, 중요한 기능이라도 Editor Starter에 추가할 것이라고 가정하지 마세요.  
특히 [포함되지 않은 기능](/docs/editor-starter/features-not-included) 페이지에 나열된 기능이라면 더욱 그렇습니다.

그렇긴 하지만, 우리는 합리적인 경우 Editor Starter를 유지보수하고 개선할 계획입니다.

## Timeline component를 구매해야 하나요, 아니면 Editor Starter를 구매해야 하나요?

[Timeline](/docs/timeline) component는 timeline만 필요하고 그 주변을 구축하고 싶다면 좋습니다.

Editor Starter도 timeline을 가지고 있지만, video editor에 있으면 좋은 더 많은 기능들을 가지고 있습니다:

- Zoomable Canvas
- Captioning
- Exporting
- Asset uploading 및 local caching
- Font Picker
- Undo Stack

## Editor Starter를 어떻게 업데이트할 수 있나요?

여러분의 필요에 맞게 전체 source code를 customize할 수 있게 함으로써, 우리는 여러분의 editor가 우리의 starter에서 빠르게 분기될 것이라고 예상하며, 이로 인해 일반적으로 fork한 후 Editor를 업데이트하기 어렵게 됩니다.

Editor Starter를 fork한다면, repository main page 상단에 나타나는 GitHub UI를 사용하여 우리의 upstream 변경사항을 가져오는 옵션이 있습니다.

Editor Starter를 project에 복사한다면, 코드를 복사한 시점 이후 우리가 template에 만든 변경사항을 수동으로 비교해야 합니다.

전체 codebase를 채택하고 유지보수할 수 있으며, 함께 제공되는 기능 세트에 만족한다면서만 Editor Starter를 사용해야 합니다.  
이 때문에 우리는 견고하다고 여겨지는 기능들만 포함하고, [모든 것을 문서화했습니다](/docs/editor-starter/features).

우리는 지속적으로 새로운 기능과 개선사항을 추가할 것이므로, 사용을 시작하기에 완벽한 시점은 절대 없습니다.

## Timeline component를 구매했는데, Editor Starter로 업그레이드할 수 있나요?

이미 [Timeline](/docs/timeline)과 Editor Starter를 모두 구매했다면, Timeline component에 대한 전액 환불을 받을 자격이 있습니다.

같은 email 주소로 구매한 후 Timeline 구매에 사용한 email 주소로 [hi@remotion.dev](mailto:hi@remotion.dev)에 연락하세요.

## 이것은 client-side rendering / WebCodecs를 사용하나요?

아니요, rendering은 [Remotion Lambda](/docs/editor-starter/rendering)를 사용하여 발생합니다.  
그렇긴 하지만, 우리의 목표는 미래에 video가 client-side에서 render될 수 있는 mode를 만드는 것입니다.

이에 대한 timeline은 없습니다 - 현재 상태가 여러분에게 맞는 경우에만 구매하시기를 권합니다!

## Remotion Lambda를 사용해야 하나요?

기본 template은 완전히 serverless 방식으로 배포될 수 있습니다.  
long-running server에서 render하고 싶다면, Remotion [Server-side rendering](/docs/ssr) API를 사용하도록 architecture를 수정할 수 있습니다:

- [frontend code](/docs/editor-starter/setup)를 기존 project에 복사
- [backend routes](/docs/editor-starter/backend-routes)의 경우, long-running server에서 구현합니다. rendering endpoint를 구현하는 방법은 [Render Server](/templates/render-server)를 참조로 사용할 수 있습니다.

## Remotion이 자체 video editor를 출시하나요?

아니요 - 우리는 스스로 이 분야에 진출하기보다는 개발자들이 자신만의 제품을 출시할 수 있도록 돕기를 희망합니다.

### 왜 안 하나요?

처음부터 우리는 개발자들을 위한 문제 해결에 집중해왔습니다.  
이것이 우리의 독특한 강점이며, 여기서 벗어나 주의를 분산시키고 싶지 않습니다.

성공적인 video editor를 출시하려면 marketing과 communication에 많은 투자를 해야 합니다.  
이것은 단순히 우리의 강점이 아니므로, template을 출시함으로써 우리의 핵심 역량인 video 기술에 집중할 수 있습니다.

## 참고 항목

- [구매 전 확인사항](/docs/editor-starter/before-you-buy)