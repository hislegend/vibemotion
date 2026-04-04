export const stringSeemsRightToLeft = (text: string): boolean => {
	// text가 우측에서 좌측 문자를 포함하는지 확인
	const rtlChars =
		/[\u0590-\u05FF\u0600-\u06FF\u0700-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFC]/;
	return rtlChars.test(text);
};
