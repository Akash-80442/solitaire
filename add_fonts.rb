require 'xcodeproj'
project_path = 'ios/MyApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)
target = project.targets.first

fonts_group = project.main_group.find_subpath('Fonts', true)
fonts_dir = 'assets/fonts'

Dir.glob("#{fonts_dir}/*.ttf").each do |font_file|
  file_ref = fonts_group.new_reference("../#{font_file}")
  target.resources_build_phase.add_file_reference(file_ref, true)
end

project.save
