import Image from 'next/image'
import { Users, Package } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function About() {
  return (
    <section className="py-16 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Content and Statistics */}
          <div>
            {/* Section Header */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                About Us
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                Desi Manwar Pvt Ltd is an Indian exporter of Basmati Rice,
                Sugar, Spices, Pulses, and agricultural commodities serving
                importers, distributors, and wholesale buyers worldwide. Our
                mission is to bring the authentic flavors of India to your
                table, creating a nostalgic and memorable culinary experience.
                We are dedicated to delivering exceptional customer service,
                from seamless order processing to efficient delivery.
              </p>
            </div>

            {/* Statistics */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Happy Clients */}
              <Card className="border-primary/20 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    50+
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Happy Clients
                  </p>
                </CardContent>
              </Card>

              {/* Delivery Completed */}
              <Card className="border-primary/20 bg-card">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                      <Package className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-primary mb-1">
                    179+
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Delivery Completed
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Column: Image */}
          <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden shadow-lg">
            <Image
              src="/images/about-us.jpg"
              alt="About Us"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
