"use client"; // Para garantir que o código seja executado no lado do cliente

import { useEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface ChartProps {
  id: string;
  data: { item: string; value: number }[];
}

const Chart = ({ id, data }: ChartProps) => {
  useEffect(() => {
    // Criação do gráfico
    let root = am5.Root.new(id);

    // Configurar tema
    root.setThemes([am5themes_Animated.new(root)]);

    // Criar o gráfico XY
    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 1,
      })
    );

    // Configurar cursor
    let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    // Criar e configurar os eixos
    let xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });

    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
    });

    xRenderer.grid.template.setAll({
      location: 1,
    });

    let xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: "country",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    let yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: yRenderer,
      })
    );

    // Criar a série
    let series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series 1",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        sequencedInterpolation: true,
        categoryXField: "country",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0,
    });

    series.columns.template.adapters.add("fill", function (fill, target) {
      return chart.get("colors")!.getIndex(series.columns.indexOf(target));
    });

    series.columns.template.adapters.add("stroke", function (stroke, target) {
      return chart.get("colors")!.getIndex(series.columns.indexOf(target));
    });

    // Dados do gráfico
    // let data = [
    //   { country: "Apple", value: 25 },
    //   { country: "Samsung", value: 31 },
    //   { country: "Xiaomi", value: 15 },
    //   { country: "Oppo", value: 12 },
    //   { country: "Vivo", value: 2 },
    //   { country: "Motorola", value: 24 },
    //   { country: "Realme", value: 1 },
    //   { country: "Asus", value: 3 },
    //   { country: "Huawei", value: 5 },
    //   { country: "Sony", value: 10 },
    // ];

    xAxis.data.setAll(data.sort((a, b) => b.value - a.value));
    series.data.setAll(data.sort((a, b) => b.value - a.value));

    // Animações
    series.appear(1000);
    chart.appear(1000, 100);

    // Cleanup ao desmontar o componente
    return () => {
      root.dispose();
    };
  }, []);

  return <div id={id} style={{ width: "70%", height: "80%", }}></div>;
};

export default Chart;
