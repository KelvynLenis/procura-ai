import Chart from "@/components/Chart";
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