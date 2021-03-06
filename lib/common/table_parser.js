module.exports={
  getFirstTable:getFirstTable,
  parseWikiTable:parseWikiTable,
  tableToRows:tableToRows
};

function getFirstTable(lines)
{
  var afterFirstTable=false;
  var inTable=false;
  return lines.filter(function(line){
    if(afterFirstTable) return false;
    if(line == '{| class="wikitable"')
      inTable=true;

    if(inTable && line == ' |}') {
      inTable = false;
      afterFirstTable = true;
      return true;
    }

    return inTable;
  });
}

function tableToRows(lines)
{
  lines=lines.slice(1);
  if(lines[0].trim()=="|-")
    lines.shift();
  var rows=[];
  var currentRow=[];
  lines.forEach(function(line){
    if(line.trim()=="|-" || line == " |}")
    {
      rows.push(currentRow);
      currentRow=[];
    }
    else currentRow.push(line);
  });
  if(currentRow.length!=0 && currentRow[0].trim()!="") rows.push(currentRow);
  return rows;
}

// output format : one object by line, repetition of the row in case of rowspan>1 (for example repetition of Packet Id)
// for colspan>1 : [first element,second element] or {colName:first element,...} if ! are given
// need to implement colspan
function rowsToSimpleRows(rows)
{
  // for recursive arrays ( / colspan ) : have a currentCols : no : rec
  var rawCols=rows[0];
  var colNames=rawCols.map(function(rawCol){
    return rawCol.split("!")[1].trim();
  });

  // for rowspan
  var currentValues={};
  var values=[];
  return rows.slice(1).map(function(row)
  {
    var currentColValue="";
    var currentColRemaining=0;

    var colToAdd=colNames.length-row.length;
    var i;
    for(i=0;i<colToAdd;i++) if(currentValues[i]!==undefined && currentValues[i].n>0) row.unshift("");
    var fields=[];
    for(i=0;i<row.length;i++)
    {
      var col=row[i];
      col=col.substring(2);
      var parts,value,n;
      if(col.indexOf("colspan")!=-1)
      {
        parts=col.split("|");
        value=parts[1].trim();
        n=parts[0].replace(/^.*colspan="([0-9]+)".*/,'$1');
        currentColValue=value;
        currentColRemaining=n;
      }
      else if(col.indexOf("rowspan")!=-1)
      {
        parts=col.split("|");
        value=parts[1].trim();
        n=parts[0].replace(/^.*rowspan="([0-9]+)".*/,'$1');
        currentValues[i]={n:n,value:value};
      }
      if(currentValues[i]!==undefined && currentValues[i].n>0)
      {
        currentValues[i].n--;
        fields.push(currentValues[i].value);
      }
      else if(currentColRemaining!=0)
      {
        while(currentColRemaining>0)
        {
          fields.push(currentColValue);
          currentColRemaining--;
        }
      }
      else fields.push(col.trim());
    }
    return fields.reduce(function(values,value,i){
      values[colNames[i]]=value;
      return values;
    },{});
  });
}


function parseWikiTable(lines)
{
  var rows=tableToRows(lines);
  return rowsToSimpleRows(rows);
}