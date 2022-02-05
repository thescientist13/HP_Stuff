+++
title = "Potter Family"
date = 2022-02-05T04:27:33-05:00
weight = 5
chapter = true
pre = ""
+++

# Potter Family

{{<mermaid>}}
flowchart TB
  p1f1(? ? Potter\nb? - d?)
  p1m1(? ? Fleamont\nb? - d?)
  p2f1(Henry ? Potter\nb? - d?)
  p2m1(? ? ?\nb? - d?)
  p3f1(? ? Potter\nb? - d?)
  p3m1(? ? ?\nb? - d?)
  p4f1(Fleamont ? Potter\nb? - d1979)
  p4m1(Euphemia ? ?\nb? - d?)
  p5f1(Charlus ? Potter\nb? - d?)
  p5m1(Dorea ? Black\nb1920 - d1977)
  p6m1(? ? Potter\nb? - d?)
  p7m1(James ? Potter\nb1960 - d1981-10-31)
  p7f1(Lily J. Evans\nb1960-01-30 - d1981-10-31)
  p8m1(Harry James Potter\nb1980-07-31 - )
  p8f1(Ginevra Molly Weasley\nb1981-08-11 - )

  subgraph p1 [" "]
    p1f1 --- p1m1
  end

  subgraph p2 [" "]
    p2f1 --- p2m1
  end
  p1 --> p2
  
  subgraph p3 [" "]
    p3f1 --- p3m1
  end
  p1 --> p3

  subgraph p4 [" "]
    p4f1 --- p4m1
  end
  p2 --> p4

  subgraph p5 [" "]
    p5f1 --- p5m1
  end
  p3 --> p5

  p5 --> p6m1
 
  subgraph p7 [" "]
    p7m1 --- p7f1
  end
  p4 --> p7

  subgraph p8 [" "]
    p8m1 --- p8f1
  end
  p7 --> p8
  
{{</mermaid>}}

