import Chart from "@/components/Charts/Chart";
import { TestPageComponent } from "@/components/TestPageComponent";
import { topBrandsStolen } from "@/utils/ChartData";

export default async function page() {

  return (
    <>
      {/* <Chart id="brands" data={topBrandsStolen} /> */}
      <TestPageComponent />
    </>
  )
}