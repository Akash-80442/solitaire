require 'xcodeproj'
project_path = 'ios/MyApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.first

fonts_group = project.main_group.find_subpath('Fonts', true)
fonts_dir = 'assets/fonts'

Dir.glob("#{fonts_dir}/*.ttf").each do |font_file|
  file_ref = fonts_group.files.find { |f| f.path == "../#{font_file}" || f.path == font_file }
  if file_ref
    target.resources_build_phase.remove_file_reference(file_ref)
    file_ref.remove_from_project
  end
end

project.save
