import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ClipboardCheck, File, MessageSquarePlus } from 'lucide-react'
import { ReactNode } from 'react'

export function Features() {
    return (
        <section className="py-16 md:py-32">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Built to cover your needs</h2>
                    <p className="mt-4">Streamline your note-taking with powerful AI assistance and smart organization.</p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
                    <Card className="group border-0 bg-muted shadow-none">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <File className="size-6" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Create Smart Notes</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm">Easily create and organize your notes in one secure place.</p>
                        </CardContent>
                    </Card>

                    <Card className="group border-0 bg-muted shadow-none">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <ClipboardCheck className="size-6" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">You have full control</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm">Access and edit your notes whenever and wherever you need them.</p>
                        </CardContent>
                    </Card>

                    <Card className="group border-0 bg-muted shadow-none">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <MessageSquarePlus className="size-6" aria-hidden />
                            </CardDecorator>

                            <h3 className="mt-6 font-medium">Powered By AI</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-sm">Let our AI create concise summaries of your lengthy notes with one click.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div aria-hidden className="relative mx-auto size-36 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]">
        <div className="absolute inset-0 [--border:black] dark:[--border:white] bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"/>
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-t border-l">{children}</div>
    </div>
)
