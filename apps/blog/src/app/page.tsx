import { Badge } from "@repo/ui/badge";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export default function BlogHome() {
  return (
    <main className="flex min-h-[calc(100dvh-12rem)] flex-col justify-between gap-12">
      <section className="space-y-8">
        <div className="space-y-3">
          <Badge variant="secondary">blog.jungwoonkwon.com</Badge>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">블로그 준비 중</h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-7 sm:text-base">
            글과 콘텐츠 구조는 다음 단계에서 정리합니다. 이 앱은 포트폴리오와 분리된 Next.js
            블로그로 운영됩니다.
          </p>
        </div>

        <Card className="border">
          <CardHeader>
            <CardTitle className="text-base">Next steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>콘텐츠 모델 결정</p>
            <p>MDX 기반 글 작성 흐름 설계</p>
            <p>목록, 상세, 태그 화면 구현</p>
          </CardContent>
        </Card>
      </section>

      <Button asChild className="w-fit">
        <Link href="https://jungwoonkwon.com">
          포트폴리오로 이동
          <ArrowUpRight className="ml-2 size-4" />
        </Link>
      </Button>
    </main>
  );
}
