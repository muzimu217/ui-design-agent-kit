-- acmart compatibility filter (PDF build only; the DOCX build skips it).
-- 1) Tables: longtable -> tabular. longtable cannot be used in twocolumn
--    layouts, and acmart sigconf is twocolumn. Keep authored tables narrow;
--    this filter keeps everything single-column.
-- 2) Figures: {.wide} promotes \begin{figure} to \begin{figure*} (span both
--    columns). Every figure with a caption gets \label{fig:<image-basename>}
--    derived from its image filename, so text can use \ref{fig:...}.

local function table_to_tabular(el)
  local tex = pandoc.write(pandoc.Pandoc({el}), 'latex')
  tex = tex:gsub('\\begin{longtable}%[%]', '\\begin{tabular}')
  tex = tex:gsub('\\endfirsthead.-\\endhead\n', '')
  tex = tex:gsub('\\endlastfoot\n', '')
  tex = tex:gsub('\\end{longtable}', '\\end{tabular}')
  local capt = tex:match('\\caption%b{}\\tabularnewline\n')
  if capt then
    local c = capt:match('\\caption%b{}')
    tex = tex:gsub('\\caption%b{}\\tabularnewline\n', '')
    tex = '\\begin{table}[t]\n' .. c .. '\n' .. tex .. '\\end{table}\n'
  end
  return pandoc.RawBlock('latex', tex)
end

function Table(el) return table_to_tabular(el) end

function Figure(fig)
  local tex = pandoc.write(pandoc.Pandoc({fig}), 'latex')
  local name = tex:match('([%w%-_]+)%.png') or tex:match('([%w%-_]+)%.jpe?g')
  if name and not tex:find('\\label') then
    tex = tex:gsub('(\\caption%b{})', '%1\\label{fig:' .. name .. '}')
  end
  local wide = fig.attr.classes:find('wide')
  if not wide then
    fig.content:walk({
      Image = function(im) if im.attr.classes:find('wide') then wide = true end end
    })
  end
  if wide then
    tex = tex:gsub('\\begin{figure}', '\\begin{figure*}')
    tex = tex:gsub('\\end{figure}', '\\end{figure*}')
  end
  return pandoc.RawBlock('latex', tex)
end
